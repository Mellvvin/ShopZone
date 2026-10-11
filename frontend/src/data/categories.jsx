import {
  FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
  FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
  FaRunning, FaHeartbeat, FaBoxOpen,
} from 'react-icons/fa';

export const CATEGORIES = [
  { label: 'Electronics', icon: <FaMobileAlt />, value: 'Electronics' },
  { label: 'Fashion & Apparel', icon: <FaTshirt />, value: 'Fashion & Apparel' },
  { label: 'Fabric & Textiles', icon: <FaScroll />, value: 'Fabric & Textiles' },
  { label: 'Home & Kitchen', icon: <FaHome />, value: 'Home & Kitchen' },
  { label: 'Food & Grocery', icon: <FaShoppingBasket />, value: 'Food & Grocery' },
  { label: 'Beauty & Personal Care', icon: <FaSpa />, value: 'Beauty & Personal Care' },
  { label: 'Hardware & Tools', icon: <FaTools />, value: 'Hardware & Tools' },
  { label: 'Office & Stationery', icon: <FaPencilAlt />, value: 'Office & Stationery' },
  { label: 'Agriculture & Garden', icon: <FaSeedling />, value: 'Agriculture & Garden' },
  { label: 'Baby & Kids', icon: <FaBaby />, value: 'Baby & Kids' },
  { label: 'Sports & Outdoors', icon: <FaRunning />, value: 'Sports & Outdoors' },
  { label: 'Health & Wellness', icon: <FaHeartbeat />, value: 'Health & Wellness' },
  { label: 'General Merchandise', icon: <FaBoxOpen />, value: 'General Merchandise' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.value);