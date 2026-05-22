/**
 * Mock client directory — mirrors CLIENTS[] in change_artwork_demo_v2.html.
 */

export type PaymentMethod = 'Bank Transfer' | 'Credit' | 'Cash' | 'Card';

export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  contact: string;
  email?: string;
  city?: string;
  payment?: PaymentMethod;
  jobs?: number;
  created?: string;
}

export const CLIENTS: ClientRecord[] = [
  { id: 'C001', name: 'Ravi Kumar', company: 'Ravi Textiles', contact: '+91 98765 43210', email: 'ravi@ravitextiles.com', city: 'Hyderabad', payment: 'Bank Transfer', jobs: 6, created: '2024-04-12' },
  { id: 'C002', name: 'Sunita Patel', company: 'Star Garments', contact: '+91 87654 32109', email: 'sunita@stargarments.com', city: 'Mumbai', payment: 'Credit', jobs: 7, created: '2024-05-18' },
  { id: 'C003', name: 'Mohammed Ali', company: 'Heritage Caps', contact: '+91 76543 21098', email: 'ali@heritagecaps.com', city: 'Chennai', payment: 'Bank Transfer', jobs: 5, created: '2024-06-20' },
  { id: 'C004', name: 'Preet Singh', company: 'Blue Label Co.', contact: '+91 65432 10987', email: 'preet@bluelabel.co', city: 'Delhi', payment: 'Card', jobs: 5, created: '2024-07-15' },
  { id: 'C005', name: 'Meena Iyer', company: 'Urban Threads', contact: '+91 54321 09876', email: 'meena@urbanthreads.in', city: 'Bengaluru', payment: 'Credit', jobs: 4, created: '2024-08-05' },
];
