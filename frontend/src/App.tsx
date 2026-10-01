import PromptForm from "./components/PromptForm";
import ResultsSection from "./components/ResultsSection";

function App() {
  return (
    <main className="app">
      <section className="container">
        <header className="header">
          <h1>AI Insights</h1>
          <p>
            Generate AI-powered insights from your prompt.
          </p>
        </header>

        <PromptForm />
        <ResultsSection />
      </section>
    </main>
  );
}

export default App;