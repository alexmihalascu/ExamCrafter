import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '/android-chrome-192x192.png';

const baseMenuItems = [
  { path: '/main', label: 'Acasa', icon: 'mdi:home' },
  { path: '/history', label: 'Istoric', icon: 'mdi:history' },
  { path: '/quiz', label: 'Grile', icon: 'mdi:format-list-bulleted' },
  { path: '/sets', label: 'Seturi', icon: 'mdi:folder-table' },
  { path: '/user', label: 'Setari cont', icon: 'mdi:account' },
];

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = useMemo(() => baseMenuItems, []);
  const { currentUser, logout } = useAuth();

  const isActivePath = path => location.pathname === path;

  const handleAccountMenuOpen = event => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = async () => {
    handleAccountMenuClose();
    await logout();
    navigate('/sign-in');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: isMobile ? 0 : 24,
        mx: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : 'min(1200px, 90vw)',
        borderRadius: isMobile ? 0 : 999,
        px: isMobile ? 0 : 2,
        mt: isMobile ? 0 : 2,
        background: 'rgba(10, 12, 28, 0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 55px rgba(5,6,22,0.35)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <Toolbar sx={{ py: isMobile ? 1 : 1.5 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/main')}>
            <img
              src={logo}
              alt="App Logo"
              style={{
                width: 40,
                height: 40,
                filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.2))',
              }}
            />
          </IconButton>
        </motion.div>

        <Box sx={{ flexGrow: 1, ml: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'white',
            }}
          >
            ExamCrafter
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <Icon icon="mdi:menu" width="24" height="24" />
            </IconButton>

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  width: 280,
                  background: theme.palette.background.paper,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                {currentUser && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={currentUser.photoURL || undefined}>
                        {currentUser.displayName?.[0] || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {currentUser.displayName || 'Utilizator'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentUser.email}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate('/user');
                          setDrawerOpen(false);
                        }}
                      >
                        Profil
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          navigate('/sets');
                          setDrawerOpen(false);
                        }}
                      >
                        Seturi
                      </Button>
                      <Button color="error" size="small" onClick={handleLogout}>
                        Deconectare
                      </Button>
                    </Stack>
                  </Paper>
                )}
                <Typography variant="h6" color="primary" gutterBottom>
                  Meniu
                </Typography>
                <List>
                  {menuItems.map(item => (
                    <ListItem
                      key={item.path}
                      button
                      selected={isActivePath(item.path)}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: `${theme.palette.primary.main}15`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Icon icon={item.icon} width={22} height={22} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          color: isActivePath(item.path) ? theme.palette.primary.main : undefined,
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem button onClick={toggleDarkMode}>
                    <ListItemIcon>
                      <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} />
                    </ListItemIcon>
                    <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Stack direction="row" spacing={1.2}>
            {menuItems.map(item => (
              <motion.div key={item.path} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <IconButton
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    px: 2.5,
                    borderRadius: 999,
                    transition: 'all 0.2s ease',
                    backgroundColor: isActivePath(item.path)
                      ? 'rgba(255,255,255,0.16)'
                      : 'transparent',
                  }}
                >
                  <Typography>{item.label}</Typography>
                </IconButton>
              </motion.div>
            ))}
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} />
            </IconButton>
            {currentUser && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleAccountMenuOpen}
                  sx={{ ml: 1, borderRadius: 3 }}
                >
                  <Avatar src={currentUser.photoURL || undefined} sx={{ width: 36, height: 36 }}>
                    {currentUser.displayName?.[0] || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={accountAnchorEl}
                  open={Boolean(accountAnchorEl)}
                  onClose={handleAccountMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="subtitle2">
                        {currentUser.displayName || 'Utilizator'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentUser.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    onClick={() => {
                      handleAccountMenuClose();
                      navigate('/user');
                    }}
                  >
                    <ListItemIcon>
                      <Icon icon="mdi:account" />
                    </ListItemIcon>
                    <ListItemText primary="Profil" />
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleAccountMenuClose();
                      navigate('/sets');
                    }}
                  >
                    <ListItemIcon>
                      <Icon icon="mdi:folder-table" />
                    </ListItemIcon>
                    <ListItemText primary="Seturi" />
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Icon icon="mdi:logout" color={theme.palette.error.main} />
                    </ListItemIcon>
                    <ListItemText primary="Deconectare" />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
