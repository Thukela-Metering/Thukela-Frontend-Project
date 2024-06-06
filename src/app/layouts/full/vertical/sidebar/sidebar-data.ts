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
        displayName: 'PropertyGroup Link',
        iconName: 'point',
        route: 'apps/building/buildingPropertyGroup',     
      },
      {
        displayName: 'Building Owner',
        iconName: 'point',
        route: 'apps/building/buildingOwner',     
      },
      {
        displayName: 'Building Portfolio',
        iconName: 'point',
        route: 'apps/building/Portfolio',     
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
