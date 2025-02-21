import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { id, symbol, date, close_price } = req.body;

      // Validate required fields
      if (!id || !symbol || !date || close_price === undefined) {
        return res.status(400).json({ error: 'Missing required fields: id, symbol, date, or close_price' });
      }

      // Update the record in the kline_data table
      const { data, error } = await supabase
        .from('kline_data')
        .update({ symbol, date, close_price })
        .eq('id', id);

      if (error) {
        throw error;
      }

      res.status(200).json({ message: 'K-Line data updated successfully', data });
    } catch (error) {
      console.error('Error updating K-Line data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
