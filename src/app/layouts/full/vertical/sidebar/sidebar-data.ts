import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
 
  {
    displayName: 'User Management',
    iconName: 'user-plus',
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
    navCap: 'Buildings ',
  },
  {
    displayName: 'Building Management',
    iconName: 'apps',
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
    navCap: 'Accounts',
  },
  {
    displayName: 'Invoicing',
    iconName: 'file-invoice',
    route: '/apps',
    children: [
      {
        displayName: 'Invoice List',
        iconName: 'point',
        route: 'apps/invoice',     
      },
      {
        displayName: 'Statement Screen',
        iconName: 'point',
        route: 'apps/statement',     
      },
      {
        displayName: 'Load Payment',
        iconName: 'point',
        route: 'apps/statementSearch',              
      },
      {
        displayName: 'Payment List',
        iconName: 'point',
        route: 'apps/payment',              
      },
      { displayName: 'Credit Note',
        iconName: 'point',
        route: 'apps/creditNote',   
      },
      { displayName: 'Recurring Invoices',
        iconName: 'point',
        route: 'apps/recurring',   
      }
    ],
  },
  {
    navCap: 'Tools',
  },
  {
    displayName: 'Tools',
    iconName: 'file-invoice',
    route: '/apps',
    children: [
      {
        displayName: 'Hangfire Dashboard',
        iconName: 'point',
        route: 'apps/hangfire',     
      },
    ],
  },
  
];
