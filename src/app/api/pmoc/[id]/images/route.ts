import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { images } = await request.json()
    const supabase = createClient()
    
    // Deletar imagens existentes
    const { error: deleteError } = await supabase
      .from('report_images')
      .delete()
      .eq('pmoc_report_id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Inserir novas imagens
    if (images && images.length > 0) {
      const imagesToInsert = images.map((img: any) => ({
        pmoc_report_id: params.id,
        image_url: img.url,
        image_name: img.filename,
        image_type: img.filename.split('.').pop(),
        file_size: img.size,
        description: img.description || null,
        upload_date: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('report_images')
        .insert(imagesToInsert)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving report images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('report_images')
      .select('*')
      .eq('pmoc_report_id', params.id)
      .order('upload_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching report images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}