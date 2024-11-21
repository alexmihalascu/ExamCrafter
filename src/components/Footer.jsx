import React from 'react';
import { Box, Typography, Container, Link, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Paper 
      component={motion.footer}
      elevation={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        mt: 'auto',
        backdropFilter: 'blur(10px)',
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.dark}15 0%, 
          ${theme.palette.primary.main}10 50%,
          ${theme.palette.primary.light}05 100%)`,
        borderTop: `1px solid ${theme.palette.primary.main}20`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.background.paper,
          opacity: 0.8,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Typography
            sx={{
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.95rem'
            }}
          >
            © {currentYear} ExamCrafter
            <span style={{ color: theme.palette.text.secondary }}>•</span>
            Aplicație creată de
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://alexandrumihalascu.tech"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: -2,
                    left: 0,
                    background: `linear-gradient(90deg, 
                      ${theme.palette.primary.main}, 
                      ${theme.palette.primary.light})`,
                    transition: 'width 0.3s ease'
                  },
                  '&:hover': {
                    color: theme.palette.primary.light,
                    '&::after': {
                      width: '100%'
                    }
                  }
                }}
              >
                Alexandru Mihalașcu
              </Link>
            </motion.div>
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;