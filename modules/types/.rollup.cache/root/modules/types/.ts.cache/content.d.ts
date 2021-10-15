import { Static } from "@sinclair/typebox";
export declare const PostData: import("@sinclair/typebox").TObject<{
    slug: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    draft: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    featured: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    img: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lastEdit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    publishedOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tldr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare type PostData = Static<typeof PostData>;
export declare const Posts: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
    slug: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    draft: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    featured: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    img: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lastEdit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    publishedOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tldr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>>;
export declare type Posts = Static<typeof Posts>;
export declare const BlogIndex: import("@sinclair/typebox").TObject<{
    posts: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
        slug: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TString;
        category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        draft: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        featured: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        img: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        lastEdit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        publishedOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        tldr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    title: import("@sinclair/typebox").TString;
}>;
export declare type BlogIndex = Static<typeof BlogIndex>;
//# sourceMappingURL=content.d.ts.map