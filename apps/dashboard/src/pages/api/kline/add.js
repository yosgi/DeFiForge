import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { symbol, date, close_price } = req.body;

    if (!symbol || !date) {
      return res.status(400).json({ message: 'Symbol and Date are required.' });
    }

    try {
      const { data, error } = await supabase
        .from('kline_data')
        .insert([{ symbol, date, close_price }]);

      if (error) throw error;

      res.status(201).json({ message: 'K-Line data added successfully', data });
    } catch (error) {
      console.error('Error adding K-Line data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
