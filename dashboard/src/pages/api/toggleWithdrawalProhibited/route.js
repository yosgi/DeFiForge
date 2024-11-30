import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, isWithdrawalProhibited } = req.body;

    if (typeof id === 'undefined' || typeof isWithdrawalProhibited === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ isWithdrawalProhibited })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
