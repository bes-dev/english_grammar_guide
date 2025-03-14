# ВремяГид - Interactive English Grammar Guide

ВремяГид (VremyaGuide) is an interactive web application designed to help Russian-speaking users master English grammar, with a primary focus on verb tenses, conditionals, and voices. The application provides an algorithm-based approach to selecting the correct English tense and construction based on users' needs.

## Features

- **Interactive Tense Selection Algorithm**: Step by step guidance to determine the correct English tense
- **Comprehensive Grammar Coverage**: 
  - 16 English tenses
  - Active and passive voice constructions
  - 5 types of conditional sentences
- **Reference Materials**: Detailed explanations, formulas and examples for each grammar construction
- **User-friendly Interface**: Intuitive navigation with clear explanations in Russian
- **Mobile-responsive Design**: Works on all device sizes

## How It Works

1. **Main Algorithm**: Users answer simple questions about what they want to say, and the application guides them to the correct grammatical construction.
   - Focus: Determine if the focus is on the actor, the object, or a condition
   - Time: Select the time period (past, present, future)
   - Character: Specify the nature of the action (regular, in progress, completed, etc.)

2. **Reference Sections**: Users can also directly access information about:
   - Tenses: All 16 English tenses with explanations, formulas, and examples
   - Voices: Active and passive voice constructions
   - Conditionals: All 5 types of conditional sentences with examples

3. **Detailed Results**: For each grammar construction, the app provides:
   - Affirmative, negative, and question formulas
   - Multiple examples with translations
   - Usage notes and time markers
   - Comparison with similar tenses

## Technical Implementation

The application is built using a modern JavaScript architecture with an MVC pattern:

- **Models**: Data handling and algorithm logic (`/assets/js/models/`)
- **Views**: UI rendering and user interaction (`/assets/js/views/`)
- **Controllers**: Business logic and event handling (`/assets/js/controllers/`)
- **Router**: Single page application navigation
- **Event Bus**: Communication between components
- **Store**: Application state management
- **Utilities**: Helper functions and templates

Configuration for the algorithm is stored in JSON files:
- `config/algorithms/vremya-guide/steps.json`: Algorithm steps and options
- `config/algorithms/vremya-guide/rules.json`: Logic for determining the next step
- `config/algorithms/vremya-guide/results.json`: Detailed information for each grammar construction

## Installation

1. Clone the repository
2. Open the `index.html` file in your web browser
3. No build process or server setup is required - the application works as a standalone HTML/CSS/JS project

## Development

To add new features or modify existing ones:

1. Algorithm modifications should be made in the configuration files in `/config/algorithms/`
2. UI changes can be made in the corresponding view files in `/assets/js/views/`
3. Business logic changes should be made in the controller files in `/assets/js/controllers/`
4. CSS styling is separated into components in `/assets/css/`

## License

See the [LICENSE](LICENSE) file for details.

## Credits

ВремяГид was created to make English grammar selection intuitive and accessible, focusing on helping users choose the right grammar constructions without advanced grammatical knowledge.