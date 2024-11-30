import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { id, ...updatedFields } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing required fields: id' });
      }

      const { data, error } = await supabase
        .from('investments')
        .update(updatedFields)
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Investment updated successfully', data });
    } catch (error) {
      console.error('Error updating investment:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
