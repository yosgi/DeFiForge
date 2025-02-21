import { ethers } from 'ethers';
import supabase from '@/lib/supabase';
import axios from 'axios';

// BNB转账配置
const provider = new ethers.JsonRpcProvider(process.env.BNB_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function getBnbValueInWei(usdtAmount) {
  try {
    // Fetch the exchange rate from a reliable API
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether&vs_currencies=usd');
    const bnbToUsdRate = response.data.binancecoin.usd;
    const usdtToBnbRate = 1 / bnbToUsdRate;

    // Calculate the BNB equivalent in WEI
    const bnbValue = usdtAmount * usdtToBnbRate;
    console.log('BNB value:', bnbValue);
    const roundedBnbValue = bnbValue.toFixed(10)
    return ethers.parseUnits(roundedBnbValue.toString(), 'ether');
  } catch (error) {
    console.error('Error fetching BNB/USDT exchange rate:', error);
    throw new Error('Failed to fetch exchange rate');
  }
}
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { submissionId, action } = req.body;

    if (!submissionId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 更新状态
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .select('wallet_address, status')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submissionData) {
      return res.status(500).json({ error: submissionError.message });
    }
   
    if (action === 'approved') {
      // 处理BNB转账
      try {
        const bnbValue = await getBnbValueInWei(0.3); // Convert 0.3 USDT to BNB
        const gasPrice = (await provider.getFeeData()).gasPrice;
        console.log('Gas price:', gasPrice.toString());
        const tx = await wallet.sendTransaction({
          to: submissionData.wallet_address,
          value: bnbValue,
          gasPrice: gasPrice
        });
        await tx.wait();

        // 更新数据库状态
        await supabase
          .from('submissions')
          .update({ status: 'approved' })
          .eq('id', submissionId);

        return res.status(200).json({ message: 'Submission approved and payment sent' });
      } catch (error) {
        console.error('Error sending BNB:', error);
        return res.status(500).json({ error: 'BNB transfer failed'+ error });
      }
    } else if (action === 'rejected') {
      await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);

      return res.status(200).json({ message: 'Submission rejected' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
