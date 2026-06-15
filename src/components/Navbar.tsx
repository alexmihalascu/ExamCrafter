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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import logo from '/android-chrome-192x192.png';

const menuItems = [
  { path: '/main', label: 'Acasa', icon: 'ph:house' },
  { path: '/history', label: 'Istoric', icon: 'ph:clock-counter-clockwise' },
  { path: '/quiz', label: 'Grile', icon: 'ph:list-checks' },
  { path: '/sets', label: 'Seturi', icon: 'ph:folders' },
];

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = ({ darkMode, toggleDarkMode }: NavbarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    setAccountAnchorEl(null);
    await logout();
    navigate('/sign-in');
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', py: 1, gap: 1 }}>
        <Box
          component="button"
          onClick={() => navigate('/main')}
          aria-label="ExamCrafter - acasa"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            p: 0.5,
            borderRadius: 2,
          }}
        >
          <img src={logo} alt="" width={32} height={32} style={{ borderRadius: 8 }} />
          <Typography
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            ExamCrafter
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {isMobile ? (
          <>
            <IconButton onClick={toggleDarkMode} aria-label="Comuta tema" sx={{ color: 'text.secondary' }}>
              <Icon icon={darkMode ? 'ph:sun' : 'ph:moon'} width={22} />
            </IconButton>
            <IconButton onClick={() => setDrawerOpen(true)} aria-label="Deschide meniul" sx={{ color: 'text.primary' }}>
              <Icon icon="ph:list" width={24} />
            </IconButton>

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { width: 300, p: 2 } }}
            >
              {currentUser && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, mb: 1 }}>
                  <Avatar src={currentUser.photoURL || undefined} sx={{ width: 44, height: 44 }}>
                    {currentUser.displayName?.[0] || 'U'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {currentUser.displayName || 'Utilizator'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {currentUser.email}
                    </Typography>
                  </Box>
                </Stack>
              )}
              <Divider sx={{ mb: 1 }} />
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {menuItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    selected={isActive(item.path)}
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                      <Icon icon={item.icon} width={22} />
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItemButton sx={{ borderRadius: 2 }} onClick={() => { navigate('/user'); setDrawerOpen(false); }}>
                  <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                    <Icon icon="ph:user" width={22} />
                  </ListItemIcon>
                  <ListItemText primary="Profil" />
                </ListItemButton>
                <ListItemButton sx={{ borderRadius: 2, color: 'error.main' }} onClick={handleLogout}>
                  <ListItemIcon sx={{ minWidth: 38, color: 'error.main' }}>
                    <Icon icon="ph:sign-out" width={22} />
                  </ListItemIcon>
                  <ListItemText primary="Deconectare" />
                </ListItemButton>
              </List>
            </Drawer>
          </>
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                sx={{
                  px: 1.75,
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive(item.path)
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
                }}
              >
                {item.label}
              </Button>
            ))}
            <IconButton onClick={toggleDarkMode} aria-label="Comuta tema" sx={{ ml: 0.5, color: 'text.secondary' }}>
              <Icon icon={darkMode ? 'ph:sun' : 'ph:moon'} width={22} />
            </IconButton>
            {currentUser && (
              <>
                <IconButton onClick={(e) => setAccountAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }} aria-label="Cont">
                  <Avatar src={currentUser.photoURL || undefined} sx={{ width: 34, height: 34 }}>
                    {currentUser.displayName?.[0] || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={accountAnchorEl}
                  open={Boolean(accountAnchorEl)}
                  onClose={() => setAccountAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" noWrap>{currentUser.displayName || 'Utilizator'}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {currentUser.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { setAccountAnchorEl(null); navigate('/user'); }}>
                    <ListItemIcon><Icon icon="ph:user" width={20} /></ListItemIcon>
                    <ListItemText primary="Profil" />
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Icon icon="ph:sign-out" width={20} color={theme.palette.error.main} /></ListItemIcon>
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
