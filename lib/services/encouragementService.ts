import { loadEncouragements, saveEncouragement, deleteEncouragement, Encouragement } from "../../app/utils/networkDb";

export const encouragementService = {
    async getAll(): Promise<Encouragement[]> {
        return await loadEncouragements();
    },

    async create(authorName: string, text: string): Promise<Encouragement | null> {
        return await saveEncouragement(authorName, text);
    },

    async delete(id: string): Promise<boolean> {
        return await deleteEncouragement(id);
    }
};
