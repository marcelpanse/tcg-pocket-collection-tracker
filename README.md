# TCG Pocket Collection Tracker
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-30-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

TCG Pocket Collection Tracker is an application designed to help users efficiently track their Pokémon Pocket game cards, identify optimal card packs to open, manage trades, and engage with both friends and the community at large. Our application is completely free, open-source, and prioritizes user privacy by not selling data, tracking analytics or using advertisements.

Start using the app today at https://tcgpocketcollectiontracker.com.

## Technology Stack

### Frontend
The frontend is built as a static HTML site, powered by React and TypeScript. We utilize Vite to compile it into a standalone application, which is hosted cost-free on GitHub Pages. The UI leverages ShadCN and Tailwind CSS, while react-table is employed for handling extensive card lists, supported by react-virtualize for efficient data virtualization.

### Backend
Our backend infrastructure utilizes Supabase. The backend manages user authentication (via OTP email) and includes a database for card storage.

### Technical overview
For an exstensive technical overview of the project, take a look at [this wiki page](https://deepwiki.com/marcelpanse/tcg-pocket-collection-tracker).

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/marcelpanse/tcg-pocket-collection-tracker)

## Features

- Card tracker
- Filter capabilities by expansion, pack, and rarity
- Search functionality
- Collection summary insights
- Optimal pack calculation tool
- Trade facilitation support
- Automatic card scanner from screenshots - take a look at the [details here](https://github.com/1vcian/Pokemon-TCGP-Card-Scanner)
- Community forum

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

## Contributors

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/marcelpanse"><img src="https://avatars.githubusercontent.com/u/418984?v=4?s=100" width="100px;" alt="Marcel Panse"/><br /><sub><b>Marcel Panse</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=marcelpanse" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RubenJavierBachoAlarcon"><img src="https://avatars.githubusercontent.com/u/130557846?v=4?s=100" width="100px;" alt="Ruben Javier Bacho Alarcon"/><br /><sub><b>Ruben Javier Bacho Alarcon</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=RubenJavierBachoAlarcon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SpyderHunter03"><img src="https://avatars.githubusercontent.com/u/4228398?v=4?s=100" width="100px;" alt="SpyderHunter03"/><br /><sub><b>SpyderHunter03</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=SpyderHunter03" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/graylewis"><img src="https://avatars.githubusercontent.com/u/10010793?v=4?s=100" width="100px;" alt="Gray Lewis"/><br /><sub><b>Gray Lewis</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=graylewis" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/robertfoster550"><img src="https://avatars.githubusercontent.com/u/54109737?v=4?s=100" width="100px;" alt="robertfoster550"/><br /><sub><b>robertfoster550</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=robertfoster550" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.alexandre.work/"><img src="https://avatars.githubusercontent.com/u/18624067?v=4?s=100" width="100px;" alt="Alexandre Moreau-Lemay"/><br /><sub><b>Alexandre Moreau-Lemay</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=amoreaulemay" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/afu-dev"><img src="https://avatars.githubusercontent.com/u/15209405?v=4?s=100" width="100px;" alt="Adrien Furnari"/><br /><sub><b>Adrien Furnari</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=afu-dev" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/1vcian"><img src="https://avatars.githubusercontent.com/u/15808247?v=4?s=100" width="100px;" alt="Lucian"/><br /><sub><b>Lucian</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=1vcian" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PlayInKetchup"><img src="https://avatars.githubusercontent.com/u/201633802?v=4?s=100" width="100px;" alt="PlayInKetchup"/><br /><sub><b>PlayInKetchup</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=PlayInKetchup" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CorentinGouil"><img src="https://avatars.githubusercontent.com/u/77793898?v=4?s=100" width="100px;" alt="Corentin Gouil"/><br /><sub><b>Corentin Gouil</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=CorentinGouil" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dahbar"><img src="https://avatars.githubusercontent.com/u/33298582?v=4?s=100" width="100px;" alt="Nicolas Dahbar"/><br /><sub><b>Nicolas Dahbar</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=dahbar" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Bilhalv"><img src="https://avatars.githubusercontent.com/u/128099321?v=4?s=100" width="100px;" alt="Pedro Bilhalva Oliveira"/><br /><sub><b>Pedro Bilhalva Oliveira</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=Bilhalv" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vmdumont93"><img src="https://avatars.githubusercontent.com/u/180430210?v=4?s=100" width="100px;" alt="Virginia Dumont"/><br /><sub><b>Virginia Dumont</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=vmdumont93" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stephanvane"><img src="https://avatars.githubusercontent.com/u/411353?v=4?s=100" width="100px;" alt="Stephan van Eijkelenburg"/><br /><sub><b>Stephan van Eijkelenburg</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=stephanvane" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/xander-marjoram"><img src="https://avatars.githubusercontent.com/u/26894168?v=4?s=100" width="100px;" alt="Xander Marjoram"/><br /><sub><b>Xander Marjoram</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=xander-marjoram" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rexwithluv"><img src="https://avatars.githubusercontent.com/u/114663850?v=4?s=100" width="100px;" alt="Aarón"/><br /><sub><b>Aarón</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=rexwithluv" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Fischa7"><img src="https://avatars.githubusercontent.com/u/23654548?v=4?s=100" width="100px;" alt="Fischa7"/><br /><sub><b>Fischa7</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=Fischa7" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mpierrez"><img src="https://avatars.githubusercontent.com/u/34892045?v=4?s=100" width="100px;" alt="Mathys PIERREZ"/><br /><sub><b>Mathys PIERREZ</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=mpierrez" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jejnaj"><img src="https://avatars.githubusercontent.com/u/73377131?v=4?s=100" width="100px;" alt="jejnaj"/><br /><sub><b>jejnaj</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=jejnaj" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://matteosilvestro.com/"><img src="https://avatars.githubusercontent.com/u/25161825?v=4?s=100" width="100px;" alt="Matteo Silvestro"/><br /><sub><b>Matteo Silvestro</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=msilvestro" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/javijec"><img src="https://avatars.githubusercontent.com/u/368592?v=4?s=100" width="100px;" alt="JaViJeC"/><br /><sub><b>JaViJeC</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=javijec" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aredmondd"><img src="https://avatars.githubusercontent.com/u/94017614?v=4?s=100" width="100px;" alt="Aiden Redmond"/><br /><sub><b>Aiden Redmond</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=aredmondd" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/BarisMeurer"><img src="https://avatars.githubusercontent.com/u/58820159?v=4?s=100" width="100px;" alt="BarisMeurer"/><br /><sub><b>BarisMeurer</b></sub></a><br /><a href="#design-BarisMeurer" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LandOfDar"><img src="https://avatars.githubusercontent.com/u/173207727?v=4?s=100" width="100px;" alt="Dario Landucci"/><br /><sub><b>Dario Landucci</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=LandOfDar" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/greg19"><img src="https://avatars.githubusercontent.com/u/29665730?v=4?s=100" width="100px;" alt="Grzegorz Kwacz"/><br /><sub><b>Grzegorz Kwacz</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=greg19" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bugraisadev.vercel.app/"><img src="https://avatars.githubusercontent.com/u/38170967?v=4?s=100" width="100px;" alt="Buğra Ercan"/><br /><sub><b>Buğra Ercan</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=sanshigo345" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nicolasfeyer"><img src="https://avatars.githubusercontent.com/u/17156492?v=4?s=100" width="100px;" alt="Nicolas Feyer"/><br /><sub><b>Nicolas Feyer</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=nicolasfeyer" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/StephenAloche"><img src="https://avatars.githubusercontent.com/u/38354616?v=4?s=100" width="100px;" alt="StephenAloche"/><br /><sub><b>StephenAloche</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=StephenAloche" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/velinakennedy"><img src="https://avatars.githubusercontent.com/u/153860469?v=4?s=100" width="100px;" alt="velinakennedy"/><br /><sub><b>velinakennedy</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=velinakennedy" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gregormaclaine"><img src="https://avatars.githubusercontent.com/u/45013509?v=4?s=100" width="100px;" alt="Gregor Maclaine"/><br /><sub><b>Gregor Maclaine</b></sub></a><br /><a href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/commits?author=gregormaclaine" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

## Support us
If you like this project, consider donating to help us keep it running.

<a href="https://buymeacoffee.com/pocketcollectiontracker" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## License

This project is licensed under the GNU General Public License v3.0.
