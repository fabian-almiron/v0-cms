// Supabase database utilities for the CMS
// These functions will help you integrate with your Supabase database

import { Page, PageBlock, DbPage, DbPageBlock } from './cms-types'

// SQL schema for Supabase tables (run these in your Supabase SQL editor)
export const CREATE_TABLES_SQL = `
-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_blocks table
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  props JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for published pages" ON pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Enable all access for authenticated users" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for page blocks" ON page_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages 
      WHERE pages.id = page_blocks.page_id 
      AND pages.is_published = true
    )
  );

CREATE POLICY "Enable all access for authenticated users on page_blocks" ON page_blocks
  FOR ALL USING (auth.role() = 'authenticated');
`

// Helper functions to transform between app types and database types
export function dbPageToPage(dbPage: DbPage, dbBlocks: DbPageBlock[]): Page {
  const blocks: PageBlock[] = dbBlocks
    .sort((a, b) => a.order_index - b.order_index)
    .map(dbBlock => ({
      id: dbBlock.id,
      type: dbBlock.component_type,
      order: dbBlock.order_index,
      props: dbBlock.props || {},
      isVisible: dbBlock.is_visible,
    }))

  return {
    id: dbPage.id,
    slug: dbPage.slug,
    title: dbPage.title,
    description: dbPage.description || '',
    blocks,
    isPublished: dbPage.is_published,
    createdAt: dbPage.created_at,
    updatedAt: dbPage.updated_at,
  }
}

export function pageToDbPage(page: Page): DbPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description || null,
    is_published: page.isPublished,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
  }
}

export function blockToDbBlock(block: PageBlock, pageId: string): Omit<DbPageBlock, 'created_at' | 'updated_at'> {
  return {
    id: block.id,
    page_id: pageId,
    component_type: block.type,
    order_index: block.order,
    props: block.props || null,
    is_visible: block.isVisible ?? true,
  }
}

// Example functions you'll implement with your Supabase client
export async function createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) {
  // TODO: Implement with your Supabase client
  /*
  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug: page.slug,
      title: page.title,
      description: page.description,
      is_published: page.isPublished,
    })
    .select()
    .single()

  if (error) throw error

  // Save blocks
  if (page.blocks.length > 0) {
    const blocksToInsert = page.blocks.map(block => blockToDbBlock(block, data.id))
    const { error: blocksError } = await supabase
      .from('page_blocks')
      .insert(blocksToInsert)
    
    if (blocksError) throw blocksError
  }

  return data
  */
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  // TODO: Implement with your Supabase client
  /*
  const { data: pageData, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (pageError || !pageData) return null

  const { data: blocksData, error: blocksError } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('page_id', pageData.id)
    .order('order_index')

  if (blocksError) throw blocksError

  return dbPageToPage(pageData, blocksData || [])
  */
  return null
}

export async function updatePageBlocks(pageId: string, blocks: PageBlock[]) {
  // TODO: Implement with your Supabase client
  /*
  // Delete existing blocks
  await supabase
    .from('page_blocks')
    .delete()
    .eq('page_id', pageId)

  // Insert new blocks
  if (blocks.length > 0) {
    const blocksToInsert = blocks.map(block => blockToDbBlock(block, pageId))
    const { error } = await supabase
      .from('page_blocks')
      .insert(blocksToInsert)
    
    if (error) throw error
  }
  */
} 