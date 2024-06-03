import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('intrebari').select('*').limit(45);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
