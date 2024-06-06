import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import logo from '/android-chrome-192x192.png';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { signOut } = useClerk();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
    handleDrawerToggle();
  };

  const handleLogout = async () => {
    handleClose();
    await signOut();
    navigate('/sign-in');
  };

  const menuItems = [
    { text: 'Acasă', path: '/main' },
    { text: 'Istoric', path: '/history' },
    { text: 'Grile', path: '/quiz' },
    { text: 'Setări cont', path: '/user' },
    { text: 'Deconectare', action: handleLogout }
  ];

  return (
    <>
      <AppBar position="static" sx={{ borderRadius: 2, margin: '10px' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => navigate('/main')}>
            <img src={logo} alt="Quiz App Logo" style={{ width: 40, height: 40 }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ExamCrafter
          </Typography>
          {isMobile ? (
            <>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
              >
                <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
                  <List>
                    {menuItems.map((item, index) => (
                      <ListItem button key={index} onClick={() => item.action ? item.action() : handleNavigate(item.path)}>
                        <ListItemText primary={item.text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              {menuItems.map((item, index) => (
                <Button key={index} color="inherit" onClick={() => item.action ? item.action() : handleNavigate(item.path)}>
                  {item.text}
                </Button>
              ))}
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
