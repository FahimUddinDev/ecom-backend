import { Status } from "@prisma/client";
import { HttpError } from "../../utils/customError";
import * as blogCategoryModel from "./blogCategory.model";

// helper function
const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

export const createBlogCategory = async ({
    role,
    name,
    slug,
    status
}: {
    role: string,
    name: string,
    slug?: string,
    status?: Status
}) => {
    if (role !== 'admin') throw new HttpError('Permission denied', 403);
    const finalSlug = slug ? slug : slugify(name);

    const existing = (await blogCategoryModel.findCategoryUnique({ where: { slug: finalSlug } }) || await blogCategoryModel.findCategoryUnique({ where: { name } }))

    if (existing) throw new HttpError('Category already exists', 409);

    return blogCategoryModel.createCategory({
        name: name.toLowerCase(),
        slug: finalSlug,
        status: status ?? 'active'
    })
}

export const getBlogCategoriesPublic = async () => {
    return blogCategoryModel.findCategories({
        where: { status: "active" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
    });
};

export const updateBlogCategory = async ({
    role,
    id,
    data,
}: {
    role: string;
    id: number;
    data: Partial<{ name: string; slug: string; status: Status }>;
}) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    if (data.slug) data.slug = slugify(data.slug);
    if (data.name) data.name = data.name.toLowerCase();

    return blogCategoryModel.updateCategory({ where: { id }, data });
};

export const deleteBlogCategory = async ({ role, id }: { role: string; id: number }) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    const count = await blogCategoryModel.countPostsInCategory(id);
    if (count > 0) {
        throw new HttpError(
            `Cannot delete blog category. It has ${count} posts.`,
            400
        );
    }

    return blogCategoryModel.deleteCategory({ where: { id } });
};

