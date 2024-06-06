import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          Aplicație creată cu ❤️ de către{' '}
          <Link href="https://alexandrumihalascu.tech" target="_blank" rel="noopener noreferrer">
            Alexandru Mihalașcu
          </Link>.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
