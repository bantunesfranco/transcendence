export function parseJwtTokens(jwt: string): Map<string, string> {
    const tokenMap = new Map<string, string>();
    jwt.split(' ').map((token: string) => {
      const splitToken = token.split('=');
      if (splitToken[1].endsWith(';')) {
        splitToken[1] = splitToken[1].substr(0, splitToken[1].length - 1);
      }
      tokenMap.set(splitToken[0], splitToken[1]);
    });
    return tokenMap;
  }
  