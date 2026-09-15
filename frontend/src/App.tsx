import PromptForm from "./components/PromptForm";

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
      </section>
    </main>
  );
}

export default App;