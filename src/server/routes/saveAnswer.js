import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
  const { userId, score, total_questions, date } = req.body;

  const { data, error } = await supabase
    .from('user_history')
    .insert([
      { user_id: userId, score, total_questions, date }
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Quiz result saved successfully' });
});

export default router;
