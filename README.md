# TCG Pocket Collection Tracker

TCG Pocket Collection Tracker is an application designed to help users efficiently track their Pokémon Pocket game cards, identify optimal card packs to open, manage trades, and engage with both friends and the community at large. Our application is completely free, open-source, and prioritizes user privacy by not selling data, tracking analytics, using advertisements, or accepting donations.

Start using the app today at https://tcgpocketcollectiontracker.com.

## Technology Stack

### Frontend
The frontend is built as a static HTML site, powered by React and TypeScript. We utilize Vite to compile it into a standalone application, which is hosted cost-free on GitHub Pages. The UI leverages ShadCN and Tailwind CSS, while react-table is employed for handling extensive card lists, supported by react-virtualize for efficient data virtualization.

### Backend
Our backend infrastructure utilizes Appwrite.io, an open-source alternative to Firebase or Supabase, with robust features including a free tier supporting up to 75,000 monthly active users. The backend manages user authentication (via OTP email) and includes a database for card storage.

## Features

- Card tracker
- Filter capabilities by expansion, pack, and rarity
- Search functionality
- Collection summary insights
- Optimal pack calculation tool
- Trade facilitation support

For upcoming features and tasks, please consult our [issues list](https://github.com/marcelpanse/tcg-pocket-collection-tracker/issues).

## Contribution Guidelines

We welcome contributions from the community. If you have any suggestions or feedback, please reach out.

To get started:
1. Clone the repository locally.
2. Run `pnpm install` to install dependencies.
3. Execute `pnpm dev` to launch the development server.
4. Open `https://localhost:5173` in your browser.

We maintain code standards with Biome, ensuring up-to-date formatting and linting through integrated git hooks. Installing a Biome plugin in your IDE is advised for consistency.

We encourage contributors to incrementally improve the project by making small changes and submitting pull requests for review and potential merging.

## License

This project is licensed under the GNU General Public License v3.0.
