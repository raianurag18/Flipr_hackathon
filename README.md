# 🏢 Premium Inventory Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="NextAuth.js">
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
</div>

<div align="center">
  <h3>🚀 Enterprise-grade inventory management with modern design</h3>
  <p>Real-time tracking • Role-based access • Intelligent alerts • Indian currency support</p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [👥 Authentication](#-authentication)
- [📊 Core Modules](#-core-modules)
- [🔒 Security](#-security)
- [📱 Responsive Design](#-responsive-design)
- [🎨 UI Components](#-ui-components)
- [⚡ Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🔑 Key Technologies](#-key-technologies)

---

## ✨ Features

### 📊 **Real-time Dashboard**
- Live inventory statistics with interactive visualizations
- Category-wise performance tracking
- Stock level monitoring with intelligent color-coding
- Comprehensive analytics and reporting

### 🔐 **Advanced Authentication**
- **Admin**: Complete system access and user management
- **Staff**: Secure view-only access to inventory data
- JWT-based sessions with NextAuth.js integration
- Account lockout protection against brute force attacks

### 📦 **Smart Product Management**
- Full CRUD operations with advanced search and filtering
- Category-based organization with custom colors and icons
- Bulk operations and seamless data export capabilities
- SKU management and supplier information tracking

### 🚨 **Intelligent Alert System**
- Automated low stock and out-of-stock notifications
- Multi-channel alerts (Email, Slack, Browser Push)
- Configurable reorder points and thresholds
- Real-time inventory movement tracking

### 💰 **Indian Business Ready**
- Native Rupee (₹) currency formatting
- Smart abbreviations for large amounts (1L, 2.5Cr)
- Indian number system support (Lakhs and Crores)
- Automatic profit margin calculations

### 🎨 **Premium User Experience**
- Modern glassmorphism design with smooth animations
- Fully responsive mobile-first architecture
- Dark mode support with system preference detection
- Interactive micro-animations and hover effects

### 🚀 **Advanced Features**
- **Graph Implementation**: Interactive and insightful graphs to visualize inventory data.
- **Full Offline Functionality**: The application is a Progressive Web App (PWA) and works completely offline.
- **Sync Feature**: Seamless data synchronization between local and remote databases.
- **Search Feature**: Powerful and fast search functionality to find products and inventory items.

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### **Frontend**
- **Next.js 14** - App Router with Server Components
- **React 18** - Latest React features and hooks
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Smooth animations and transitions
- **Headless UI** - Accessible component primitives
- **React Hook Form** - Performant form management
- **Recharts** - Composable charting library
- **Dexie.js** - Wrapper for IndexedDB
- **PWA** - Progressive Web App for offline support

</td>
<td valign="top" width="50%">

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **NextAuth.js** - Secure authentication system
- **bcrypt** - Password hashing and security
- **Zod** - Runtime type validation
- **React Hot Toast** - Beautiful notifications
- **IndexedDB** - Client-side storage

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or later
- MongoDB 4.4 or later (local or cloud)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/premium-inventory
cd premium-inventory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/premium-inventory

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Email Notifications (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Start development server

```bash
npm run dev
```

🎉 **Access the application at:** `http://localhost:3000`

---

## 👥 Authentication

### Default Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@company.com` | `admin123` | Full system management |
| **Staff** | `your email` | `your password` | Read-only inventory access |

---

## 📊 Core Modules

### **Dashboard Overview**
- **Total Products**: Real-time inventory count
- **Total Value**: Aggregate inventory value in ₹
- **Stock Alerts**: Automated low stock notifications
- **Recent Activity**: Live inventory movement feed
- **Performance Analytics**: Top-performing products by value

### **Product Management**
```javascript
// Product Schema Example
{
  name: "MacBook Pro 16\"",
  sku: "MBP-16-2024",
  category: "Electronics",
  price: 249999,        // ₹2.5L
  costPrice: 200000,    // ₹2L
  currentStock: 15,
  minimumStock: 5,
  supplier: {
    name: "Apple Inc.",
    email: "orders@apple.com",
    phone: "+1-800-APL-CARE"
  }
}
```

### **Inventory Operations**
- **Stock In**: Receive new inventory with batch tracking
- **Stock Out**: Record sales, consumption, or transfers
- **Adjustments**: Correct stock discrepancies with audit trail
- **Transfers**: Multi-location inventory management

---

## 🔒 Security

### **Authentication Security**
- **Password Protection**: bcrypt hashing with 12 salt rounds
- **Session Management**: Secure JWT tokens (24-hour expiry)
- **Brute Force Protection**: Account lockout after 5 failed attempts
- **Role-based Access**: Granular permission system

### **Data Protection**
- **Input Validation**: Comprehensive Zod schema validation
- **Injection Prevention**: MongoDB ODM protection
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: Built-in NextAuth security features

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 0-767px (Touch-optimized interface)
- **Tablet**: 768-1023px (Adaptive layouts)
- **Desktop**: 1024px+ (Full feature experience)

### **Mobile Features**
- Slide-out navigation sidebar
- Touch-friendly 44px minimum touch targets
- Optimized product cards and data tables
- Intuitive swipe gestures for interactions

---

## 🎨 UI Components

### **Design System**
- **Color Palette**: Professional blue and purple gradients
- **Typography**: Clean, hierarchical font system
- **Spacing**: Consistent 8px grid system
- **Shadows**: Layered shadow system for visual depth
- **Animations**: Smooth Framer Motion transitions

### **My Component Library**
- `StatCard` - Animated statistics display
- `ProductCard` - Interactive product showcase
- `AlertCard` - Status and notification display
- `Modal` - Overlay dialogs with smooth animations
- `Button` - Multiple variants and sizes
- `Input` - Form inputs with real-time validation

---

## ⚡ Performance

### **Frontend Optimizations**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Lazy Loading**: Components loaded on-demand
- **Efficient Caching**: Browser and API response caching

### **Backend Optimizations**
- **Database Indexing**: Optimized MongoDB query performance
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Advanced aggregation pipeline optimization
- **API Caching**: Strategic response caching for faster loads

---

## 🔑 Key Technologies

### **Graph Implementation**
- Interactive and insightful graphs to visualize inventory data.
- Track trends, sales, and stock levels over time.
- Customizable date ranges and data points for in-depth analysis.

### **Full Offline Functionality**
- The application is a Progressive Web App (PWA) and works completely offline.
- Local data is stored using IndexedDB, ensuring data availability without an internet connection.
- All core features, including product management and inventory tracking, are available offline.

### **Sync Feature**
- Seamless data synchronization between local and remote databases.
- Automatically syncs data when an internet connection is available.
- Manual sync option for on-demand data updates.
- Conflict resolution to handle data discrepancies between local and remote storage.

### **Search Feature**
- Powerful and fast search functionality to find products and inventory items.
- Search by name, SKU, category, or other attributes.
- Real-time search results with highlighting and filtering options.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Code Standards**
- Follow ESLint configuration
- Use Prettier for consistent formatting
- Write meaningful commit messages
- Add proper TypeScript types
- Include JSDoc comments for functions

---

## 🆘 Support

### **Common Issues**

<details>
<summary><strong>Database Connection Failed</strong></summary>

```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB service (Linux/macOS)
sudo systemctl restart mongod
```
</details>

<details>
<summary><strong>Environment Variables</strong></summary>

```bash
# Verify .env.local exists and has correct values
cat .env.local
```
</details>

<details>
<summary><strong>Build Errors</strong></summary>

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```
</details>

### **Get Help**
- 📧 **Email**: anuragrai211004@gmail.com
- 📖 **LinkedIn**: [Connect](https://www.linkedin.com/in/anurag-rai-674855315/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🌟 Star this repository if you find it helpful!</h3>
  
  <div>
    <a href="#-premium-inventory-management-system">⬆️ Back to Top</a> •
    <a href="#-quick-start">🚀 Quick Start</a> •
    <a href="#-core-modules">📊 Features</a> •
    <a href="#-support">🆘 Support</a>
  </div>
</div>
