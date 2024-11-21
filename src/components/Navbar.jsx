import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, Drawer, 
  List, ListItem, ListItemText, ListItemIcon, useMediaQuery, 
  useTheme, Stack, Divider 
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '/android-chrome-192x192.png';

const menuItems = [
  { path: '/main', label: 'Acasă', icon: 'mdi:home' },
  { path: '/history', label: 'Istoric', icon: 'mdi:history' },
  { path: '/quiz', label: 'Grile', icon: 'mdi:format-list-bulleted' },
  { path: '/user', label: 'Setări cont', icon: 'mdi:account' },
];

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  return (
    <AppBar 
      position={isMobile ? "fixed" : "static"}
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.dark} 0%, 
          ${theme.palette.primary.main} 100%)`,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/main')}
          >
            <img 
              src={logo} 
              alt="App Logo" 
              style={{ 
                width: 40, 
                height: 40,
                filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.2))'
              }} 
            />
          </IconButton>
        </motion.div>

        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1,
            ml: 2,
            fontWeight: 600,
            background: `linear-gradient(45deg, 
              ${theme.palette.common.white}, 
              ${theme.palette.grey[300]})`,
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          ExamCrafter
        </Typography>

        {isMobile ? (
          <>
            <IconButton 
              color="inherit" 
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                }
              }}
            >
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
                  borderLeft: `1px solid ${theme.palette.divider}`
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Meniu
                </Typography>
                <List>
                  {menuItems.map((item) => (
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
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}15`,
                          transform: 'translateX(8px)'
                        },
                        '&.Mui-selected': {
                          backgroundColor: `${theme.palette.primary.main}25`,
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon 
                          icon={item.icon} 
                          width="24" 
                          height="24"
                          color={isActivePath(item.path) ? theme.palette.primary.main : undefined}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        sx={{
                          color: isActivePath(item.path) ? theme.palette.primary.main : undefined
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem 
                    button 
                    onClick={toggleDarkMode}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} />
                    </ListItemIcon>
                    <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => navigate('/logout')}
                    sx={{
                      borderRadius: 1,
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.main + '15',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Icon icon="mdi:logout" color={theme.palette.error.main} />
                    </ListItemIcon>
                    <ListItemText primary="Deconectare" />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Stack 
            direction="row" 
            spacing={1}
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <IconButton
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    px: 2,
                    borderRadius: 1,
                    backgroundColor: isActivePath(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
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
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => navigate('/logout')}
              sx={{
                '&:hover': { 
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.common.white
                }
              }}
            >
              <Typography>Deconectare</Typography>
            </IconButton>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;