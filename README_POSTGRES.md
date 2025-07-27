## Database Support

Kanba supports both **Supabase** (default) and **PostgreSQL** as database backends.

### Quick Database Switch

```bash
# Use Supabase (default)
DATABASE_PROVIDER=supabase

# Use PostgreSQL
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/kanba_db
```

### PostgreSQL Setup

1. **Start PostgreSQL:**
   ```bash
   npm run postgres:start  # Docker
   # or install PostgreSQL locally
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env.local
   # Set DATABASE_PROVIDER=postgresql and DATABASE_URL
   ```

3. **Setup database:**
   ```bash
   npm run postgres:setup
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

**Full PostgreSQL guide:** [POSTGRES_SETUP.md](./POSTGRES_SETUP.md)

### Database Features

- **Seamless switching** between Supabase and PostgreSQL
- **Same API** for both databases
- **Docker support** for easy local development
- **Prisma ORM** for PostgreSQL
- **All existing features** work with both databases
- **Team collaboration** and **Stripe integration** supported

### Why PostgreSQL?

- **Local development** without external dependencies
- **Self-hosted deployments** with full control
- **Better performance** for complex queries
- **Advanced features** like full-text search
- **Cost-effective** for high-traffic applications 