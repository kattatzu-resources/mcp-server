import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("WeatherResource");

/**
 * Sample weather data
 */
const weatherData = {
    santiago: {
        temperature: 22,
        condition: "Soleado",
        humidity: 45,
        wind: 10,
    },
    buenosAires: {
        temperature: 25,
        condition: "Parcialmente nublado",
        humidity: 60,
        wind: 15,
    },
    lima: {
        temperature: 20,
        condition: "Nublado",
        humidity: 75,
        wind: 8,
    },
};

/**
 * Register a weather data resource
 */
export const registerWeatherResource = (server: McpServer): void => {
    server.resource(
        "weather",
        "weather.json",
        async () => {
            logger.info("Weather resource accessed");

            return {
                contents: [
                    {
                        uri: "weather.json",
                        text: JSON.stringify(weatherData, null, 2),
                        mimeType: "application/json",
                    },
                ],
            };
        }
    );

    logger.info("Weather resource registered");
};
