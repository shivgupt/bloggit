import { Static } from "@sinclair/typebox";
export declare const EditRequest: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
    content: import("@sinclair/typebox").TString;
    path: import("@sinclair/typebox").TString;
}>>;
export declare type EditRequest = Static<typeof EditRequest>;
export declare const EditResponse: import("@sinclair/typebox").TObject<{
    commit: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TString;
}>;
export declare type EditResponse = Static<typeof EditResponse>;
export declare const HistoryResponseEntry: import("@sinclair/typebox").TObject<{
    commit: import("@sinclair/typebox").TString;
    path: import("@sinclair/typebox").TString;
    timestamp: import("@sinclair/typebox").TString;
}>;
export declare type HistoryResponseEntry = Static<typeof HistoryResponseEntry>;
export declare const HistoryResponse: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
    commit: import("@sinclair/typebox").TString;
    path: import("@sinclair/typebox").TString;
    timestamp: import("@sinclair/typebox").TString;
}>>;
export declare type HistoryResponse = Static<typeof HistoryResponse>;
export declare const ReadResponse: import("@sinclair/typebox").TObject<{
    author: import("@sinclair/typebox").TString;
    content: import("@sinclair/typebox").TString;
    timestamp: import("@sinclair/typebox").TNumber;
}>;
export declare type ReadResponse = Static<typeof ReadResponse>;
export declare const RefResponse: {
    branch: import("@sinclair/typebox").TString;
    commit: import("@sinclair/typebox").TString;
};
export declare type RefResponse = Static<typeof RefResponse>;
//# sourceMappingURL=api.d.ts.map