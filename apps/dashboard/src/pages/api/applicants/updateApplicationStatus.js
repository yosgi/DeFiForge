import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, status } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: 'ID and status are required' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
