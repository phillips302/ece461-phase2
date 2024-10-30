export const fetchGreeting = async () => {
    const response = await fetch('/api/hello');
    const data = await response.json();
    return data;
  };