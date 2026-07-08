import axiosClient from "../api/axiosClient.js";
import { asArray } from "../utils/format.js";
import { mapHistory } from "./mapers/historyMapper.js";
const historyService = {

    async list() {

    const response =
        await axiosClient.get(
            "/history"
        );

    return response.map(mapHistory);

},

    async get(id) {

    const response =
        await axiosClient.get(
            `/history/${id}`
        );

    return mapHistory(response);

},
    async byInstance(instanceId) {

    const response =
        await axiosClient.get(
            `/history/instance/${instanceId}`
        );

    return response.map(mapHistory);

},

};

export default historyService;