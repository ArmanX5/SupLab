# Math Analysis App

This is a simple web application for visualizing and analyzing mathematical functions. It provides a number line for interactive exploration of function behavior.

## Features

*   **Interactive Number Line:** Visualize function values on a dynamic number line.
*   **Function Input:** Easily input and update mathematical functions.
*   **Analysis Panel:** View detailed analysis of the function.

## Getting Started

To run this project locally, follow these steps:

1.  Clone the repository:
    ```bash
    git clone https://github.com/ArmanX5/SupLab.git
    cd SupLab
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

Open your browser to `http://localhost:3000` (or the port indicated in your terminal) to view the application.

## Project Structure

*   `App.tsx`: Main application component.
*   `index.html`: HTML entry point.
*   `components/`: Contains reusable UI components.
    *   `AnalysisPanel.tsx`: Displays function analysis.
    *   `InputPanel.tsx`: Handles function input.
    *   `NumberLine.tsx`: Renders the interactive number line.
*   `utils/`: Utility functions.
    *   `mathUtils.ts`: Mathematical helper functions.

## Technologies Used

*   React
*   TypeScript
*   Vite
*   Tailwind CSS (or similar styling library, if used)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
