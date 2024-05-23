import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
 
  {
    displayName: 'User Management',
    iconName: 'box-multiple',
    route: '/apps',
    children: [
      {
        displayName: 'Manage users',
        iconName: 'point',
        route: 'apps/employee',     
      },
    ],
  },
  {
    displayName: 'Building Management',
    iconName: 'box-multiple',
    route: '/menu-level',
    children: [
      {
        displayName: 'Buildings',
        iconName: 'point',
        route: 'apps/building',     
      },
      {
        displayName: 'Building Accounts',
        iconName: 'point',
        route: 'apps/building/buildingAccount',     
      },
      {
        displayName: 'Representative Link',
        iconName: 'point',
        route: 'apps/building/buildingRepresentative',     
      },
      {
        displayName: 'propertyGroup Link',
        iconName: 'point',
        route: 'apps/building',     
      },
      {
        displayName: 'Building Owner Link',
        iconName: 'point',
        route: 'apps/building/buildingOwner',     
      },
    ],
  },

  {
    displayName: 'Forgot Password',
    iconName: 'rotate',
    route: '/authentication',
    children: [      
      {
        displayName: 'Boxed Forgot Password',
        iconName: 'point',
        route: '/authentication/boxed-forgot-pwd',
      },
    ],
  },
  {
    displayName: 'Error',
    iconName: 'alert-circle',
    route: '/authentication/error',
  },
];
