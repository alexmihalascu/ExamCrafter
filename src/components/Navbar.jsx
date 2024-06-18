import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/android-chrome-192x192.png';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 0 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => navigate('/main')}>
            <img src={logo} alt="App Logo" style={{ width: 40, height: 40 }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: 2 }}>
            ExamCrafter
          </Typography>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <Icon icon="mdi:menu" width="24" height="24" />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={handleDrawerToggle}
                  onKeyDown={handleDrawerToggle}
                >
                  <List>
                    <ListItem button onClick={() => handleNavigate('/main')}>
                      <Icon icon="mdi:home" width="24" height="24" />
                      <ListItemText primary="Acasă" />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('/history')}>
                      <Icon icon="mdi:history" width="24" height="24" />
                      <ListItemText primary="Istoric" />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('/quiz')}>
                      <Icon icon="mdi:format-list-bulleted" width="24" height="24" />
                      <ListItemText primary="Grile" />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('/user')}>
                      <Icon icon="mdi:account" width="24" height="24" />
                      <ListItemText primary="Setări cont" />
                    </ListItem>
                    <ListItem button onClick={toggleDarkMode}>
                      <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} width="24" height="24" />
                      <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('/logout')}>
                      <Icon icon="mdi:logout" width="24" height="24" />
                      <ListItemText primary="Deconectare" />
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box display="flex">
              <IconButton color="inherit" component={Link} to="/main">
                <Typography>Acasă</Typography>
              </IconButton>
              <IconButton color="inherit" component={Link} to="/history">
                <Typography>Istoric</Typography>
              </IconButton>
              <IconButton color="inherit" component={Link} to="/quiz">
                <Typography>Grile</Typography>
              </IconButton>
              <IconButton color="inherit" component={Link} to="/user">
                <Typography>Setări cont</Typography>
              </IconButton>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                <Icon icon={darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'} width="24" height="24" />
              </IconButton>
              <IconButton color="inherit" component={Link} to="/logout">
                <Typography>Deconectare</Typography>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
