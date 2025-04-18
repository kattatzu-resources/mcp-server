import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { IResource } from "../../domain/interfaces/resource.interface.js";
import { GreetingResource } from "./greeting.resource.js";
import { WeatherResource } from "./weather.resource.js";

export const createResources = (logger: ILogger): IResource[] => {
    return [
        new GreetingResource(logger),
        new WeatherResource(logger),
    ];
};
