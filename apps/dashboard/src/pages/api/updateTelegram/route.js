import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id, telegram } = req.body;

    if (!id || !telegram) {
      return res.status(400).json({ message: 'ID and Telegram handle are required' });
    }

    try {
      const { data, error } = await supabase
        .from('admin')
        .update({ telegram })
        .eq('id', id)
        .select('*');

      if (error) throw error;

      res.status(200).json({ message: 'Telegram handle updated successfully', user: data });
    } catch (error) {
      console.error('Error updating Telegram handle:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
