# 🤝 Contributors Guide

Thank you for your interest in contributing to **Kanba** — the open-source kanban tool for indie makers and builders.

To ensure a clean separation between the hosted production environment and community development, please follow the contribution rules below.

---

## 🧭 Branching Strategy

| Branch         | Purpose                                        |
|----------------|------------------------------------------------|
| `main`         | Community contributions, ongoing development   |
| `kanba-hosted` | Production branch used by [kanba.co](https://kanba.co) |

- ✅ All pull requests **must target the `main` branch**.
- 🚫 **Do NOT open pull requests to `kanba-hosted`** — it is reserved for the hosted version and updated manually.

---

## 🛠️ How to Contribute

1. **Fork** this repository  
2. **Create a new branch** from `main`:
   ```bash
   git checkout -b your-feature-name
   ```
3. Make your changes  
4. Commit with clear messages:
   - `feat: add drag-and-drop support`
   - `fix: board layout on mobile`
5. **Push** to your fork  
6. **Open a Pull Request** targeting the `main` branch

---

## 💡 Contribution Tips

- Keep PRs focused — one feature or fix per PR  
- If your change includes **breaking changes**, clearly mention it in the PR description  
- If you’re changing DB schema, auth flow, or dependencies, include setup or migration steps  
- Add screenshots for UI updates when possible  

---

## 💬 Questions?

Open an issue or start a GitHub discussion — we’re happy to help or guide your contribution.

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.


Thanks for helping make Kanba better!  
— The Kanba Team
