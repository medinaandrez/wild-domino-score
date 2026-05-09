# Spinner Scorekeeper

Marcador para **Spinner: The Original Texas Wild Domino Game**.

## Stack
- React Native + Expo (SDK 52)
- Expo Router (file-based navigation)
- NativeWind v4 (Tailwind CSS para React Native)
- AsyncStorage (persistencia local)
- EAS Build (publicación en tiendas)

## Estructura
```
app/
  _layout.tsx          # Layout raíz + GameProvider
  index.tsx            # Pantalla de inicio
  new-game.tsx         # Crear nueva partida
  game/
    index.tsx          # Marcador principal (tabla de puntajes)
    enter-scores.tsx   # Ingresar puntos de la ronda
  results.tsx          # Resultados finales
  history.tsx          # Historial de partidas
  rules.tsx            # Reglas del juego
lib/
  types.ts             # Tipos TypeScript
  gameLogic.ts         # Lógica del juego (rondas, puntajes, ranking)
  storage.ts           # AsyncStorage helpers
  GameContext.tsx      # Estado global del juego (React Context)
```

## Desarrollo local
```bash
npm install
npx expo start
```

## Publicar en tiendas

### Configurar EAS
```bash
npm install -g eas-cli
eas login
eas build:configure
```

Reemplaza `your-eas-project-id-here` en `app.json` con el ID real.

### Build de producción
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

### Submit a tiendas
```bash
npm run submit:ios
npm run submit:android
```

## Reglas del juego
- 10 rondas, cada una abierta por el doble correspondiente (9 → 0)
- Al final de cada ronda, quien no ganó suma el valor de sus fichas en mano
- Fichas Spinner (comodín): 10 puntos si quedan en mano
- Gana el jugador con el **menor puntaje total** al finalizar las 10 rondas
