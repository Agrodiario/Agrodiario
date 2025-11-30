# 🌱 Agrodiário  

Turn the hard work of your farm into real value.

<img src="https://i.imgur.com/8C3ba5b.jpeg" alt="Agrodiário Mockup" />

**Agrodiário** is a digital diary designed for family farmers to record sustainable actions such as soil management practices, soil health, reforestation, and other environmental initiatives.  
These records form an activity log that helps farmers qualify for **carbon credits** and other environmental certifications.

---

## Prerequisites
Before running the project, make sure you have installed:

- **Node.js** (recommended version: 18+)
- **Yarn**
- **PostgreSQL**

---

## Environment setup

### Create the database
Run the following command in PostgreSQL:

```sql
CREATE DATABASE agrodiario;
```

### Configure the ``.env`` file

Create a ``.env`` file in the backend following the ``.env.example`` template:

```bash
cp .env.example .env
```

### Installing dependencies

```bash
yarn install
```

## Running the project
### Front-end
```bash
yarn dev:client
```

### Back-end
```bash
yarn dev:backend
```
## Figma Design
You can view the project’s design prototype on Figma:

🎨 **Figma Project:** https://www.figma.com/design/5mupDJvETRMmNdbwiLXuQ7/AgroDi%C3%A1rio?node-id=11-1833&t=xX2ODMRWWHwvqowm-1



## Contributions

Feel free to open issues, suggest improvements, or submit pull requests.
