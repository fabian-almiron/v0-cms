import { NextRequest, NextResponse } from 'next/server'
import { deleteCMSInstance, getCMSInstanceById } from '@/lib/master-supabase'

// Environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
const VERCEL_API_URL = 'https://api.vercel.com'
const BITBUCKET_USERNAME = process.env.BITBUCKET_USERNAME
const BITBUCKET_API_TOKEN = process.env.BITBUCKET_API_TOKEN
const BITBUCKET_APP_PASSWORD = process.env.BITBUCKET_APP_PASSWORD
const BITBUCKET_AUTH_TOKEN = BITBUCKET_API_TOKEN || BITBUCKET_APP_PASSWORD
const BITBUCKET_WORKSPACE = process.env.BITBUCKET_WORKSPACE

export async function DELETE(request: NextRequest) {
  try {
    const { instanceId } = await request.json()

    if (!instanceId) {
      return NextResponse.json({ error: 'Instance ID is required' }, { status: 400 })
    }

    console.log(`🗑️ Starting full deletion of CMS instance: ${instanceId}`)

    // Get instance details before deletion
    const instance = await getCMSInstanceById(instanceId)
    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    }

    const results = {
      database: false,
      bitbucketRepo: false,
      vercelProject: false,
      errors: [] as string[]
    }

    // Step 1: Delete from database first (to mark as deleting)
    try {
      await deleteCMSInstance(instanceId)
      results.database = true
      console.log('✅ Deleted from database')
    } catch (error) {
      const errorMsg = `Failed to delete from database: ${error}`
      console.error('❌', errorMsg)
      results.errors.push(errorMsg)
    }

    // Step 2: Delete Bitbucket repository
    if (instance.vercel_git_repo && BITBUCKET_AUTH_TOKEN && BITBUCKET_WORKSPACE) {
      try {
        const repoName = extractRepoNameFromUrl(instance.vercel_git_repo)
        if (repoName) {
          await deleteBitbucketRepository(repoName)
          results.bitbucketRepo = true
          console.log(`✅ Deleted Bitbucket repository: ${repoName}`)
        }
      } catch (error) {
        const errorMsg = `Failed to delete Bitbucket repository: ${error}`
        console.error('❌', errorMsg)
        results.errors.push(errorMsg)
      }
    }

    // Step 3: Delete Vercel project
    if (instance.vercel_project_id && VERCEL_TOKEN) {
      try {
        await deleteVercelProject(instance.vercel_project_id)
        results.vercelProject = true
        console.log(`✅ Deleted Vercel project: ${instance.vercel_project_id}`)
      } catch (error) {
        const errorMsg = `Failed to delete Vercel project: ${error}`
        console.error('❌', errorMsg)
        results.errors.push(errorMsg)
      }
    }

    const successCount = Object.values(results).filter(v => v === true).length
    const totalSteps = 3

    console.log(`🎯 Deletion completed: ${successCount}/${totalSteps} steps successful`)

    return NextResponse.json({
      success: successCount > 0,
      message: `Deleted ${successCount}/${totalSteps} components`,
      results,
      instance: {
        id: instance.id,
        name: instance.name
      }
    })

  } catch (error) {
    console.error('❌ Full deletion failed:', error)
    return NextResponse.json(
      { error: 'Full deletion failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function extractRepoNameFromUrl(gitUrl: string): string | null {
  // Extract repo name from URLs like:
  // https://bitbucket.org/trukraft/repo-name.git
  // https://bitbucket.org/trukraft/repo-name
  const match = gitUrl.match(/\/([^\/]+?)(?:\.git)?$/);
  return match ? match[1] : null;
}

async function deleteBitbucketRepository(repoName: string) {
  const authHeader = BITBUCKET_API_TOKEN 
    ? `Bearer ${BITBUCKET_API_TOKEN}`
    : `Basic ${Buffer.from(`${BITBUCKET_USERNAME}:${BITBUCKET_AUTH_TOKEN}`).toString('base64')}`

  console.log(`🗑️ Deleting Bitbucket repository: ${repoName}`)

  const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE}/${repoName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Bitbucket API error (${response.status}): ${error}`)
  }

  console.log(`✅ Bitbucket repository deleted: ${repoName}`)
}

async function deleteVercelProject(projectId: string) {
  console.log(`🗑️ Deleting Vercel project: ${projectId}`)

  const apiUrl = VERCEL_TEAM_ID 
    ? `${VERCEL_API_URL}/v9/projects/${projectId}?teamId=${VERCEL_TEAM_ID}`
    : `${VERCEL_API_URL}/v9/projects/${projectId}`

  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Vercel API error (${response.status}): ${error}`)
  }

  console.log(`✅ Vercel project deleted: ${projectId}`)
}
