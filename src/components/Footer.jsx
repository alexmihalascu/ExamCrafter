import { Box, Container, Link, Stack, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ py: 3, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ExamCrafter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Construit de{' '}
            <Link
              href="https://mhlsq.ro"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              MHLSQ Software
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
