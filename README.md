# TCG Pocket collection tracker
Simple application to track your Pokemon Pocket collection

URL: https://tcgpocketcollectiontracker.com/

## Idea
Turn the existing spreadsheet into a simple web application, including all functionality currently available in the sheet.

## Tech
### Frontend
Lets make a simple static HTML website build with React. We'll use Typescript and compile it to a standalone app so we can host it for free on Github Pages.

For UI we're going to use ShadCN and Tailwind. We'll use react-table to manage infinite card lists with react-virtualize for virtualization.

### Backend
I was checking out Appwrite.io. It's a Firebase / Supabase alternative. They have a free tier of 75K monthly active users, which should be plenty. 
The only thing I'd like to use is the authentication system with a database table to store your cards (later we can add other tables to store things like decks).

Required feature list: 
- [ ] card tracker
- [ ] filters per expansion, pack, rarity
- [ ] search function
- [ ] collection summary
- [ ] best pack calculator
- [ ] trade helper

Feature ideas for later:
- [ ] deck builder (connected to best pack calculator)
