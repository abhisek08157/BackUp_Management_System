import axiosClient from "../api/axiosClient.js";
import { mapBackup } from "./mapers/backupMapper.js";

const backupService = {

    async run(payload, onProgress) {

    onProgress?.(20);

    const response =
        await axiosClient.post(

            "/backup/run",

            {

                instanceId:
                    Number(payload.instanceId),

                storageType:
                    payload.storageType

            }

        );

    onProgress?.(100);

    return mapBackup(response);

},

    async download(backupId) {

    return axiosClient.get(

        `/backup/download/${backupId}`,

        {

            responseType: "blob"

        }

    );

},


};

export default backupService;