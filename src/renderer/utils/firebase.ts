export const createActivationCode = (email: string): Promise<Response> => {
  const encode = (data: { [key: string]: string }) => {
    return Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join('&');
  };
  return fetch(
    'https://us-central1-infiniti-clips.cloudfunctions.net/createActivationCode?' +
      encode({
        email,
      }),
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
};

export const activatePremium = (code: string): Promise<Response> => {
  const encode = (data: { [key: string]: string }) => {
    return Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join('&');
  };
  return fetch(
    'https://us-central1-infiniti-clips.cloudfunctions.net/activatePremium?' +
      encode({
        code,
      }),
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
};
