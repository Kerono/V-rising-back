import express, { Application, Request, Response } from "express";
import {
  newsList,
  regions,
  resourcesList,
  resourcesGroups,
  enemiesList,
  skillsList,
  bossesList,
  briefDecriptionBosses,
  skillsBriefDescription,
  weaponsList,
  recipesList,
} from "./data";
import type {
  ResourceIds,
  SkillsFullInfoIds,
  TypesOfWeaponIds,
  EnemiesList,
  ResourcesList,
  EnemiesIds,
} from "./data";

const newsPerPage = 4;
const app: Application = express();
const port = process.env.PORT || 4000;

type ResponseError = {
  message: string;
};

app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(async (req, res, next) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  next();
});

app.get("/news/:page", async (req: Request, res: Response) => {
  const page = Number(req.params.page) || 1;
  const chunkStartIndex = newsPerPage * (page - 1);
  const chunkEndIndex = chunkStartIndex + newsPerPage;
  const newsOnPage = newsList.slice(chunkStartIndex, chunkEndIndex);

  res.send(
    JSON.stringify({
      data: newsOnPage,
      totalCount: newsList.length,
    })
  );
});

app.get("/specificNews/:newsId", async (req: Request, res: Response, next) => {
  const { newsId } = req.params;
  const searchNews = newsList.find((data) => data.id === newsId);

  if (searchNews === undefined) {
    const error: ResponseError = {
      message: "News not found",
    };
    res.status(404).send(error);
    return;
  }
  res.send(JSON.stringify(searchNews));
});

app.get("/regions", async (req: Request, res: Response) => {
  res.send(JSON.stringify(regions));
});

app.get("/resources", async (req: Request, res: Response) => {
  res.send(JSON.stringify({ resourcesList, resourcesGroups }));
});

app.get("/resource/:itemId", async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const searchResource = resourcesList[itemId as ResourceIds];
  const enemiesListFiltered: Partial<EnemiesList> = {};
  searchResource?.groups?.enemiesList.forEach((id: EnemiesIds) => {
    enemiesListFiltered[id] = enemiesList[id];
  });

  const resourcesListFiltered: Partial<ResourcesList> = {};

  const resourceRecipeId = searchResource?.groups?.resoursesList;

  recipesList[resourceRecipeId]?.forEach((group) => {
    group.recipe.forEach((recipe) => {
      resourcesListFiltered[recipe] = resourcesList[recipe];
    });
    group.resultItems.forEach((recipe) => {
      resourcesListFiltered[recipe] = resourcesList[recipe];
    });
  });

  res.send(
    JSON.stringify({
      id: itemId as ResourceIds,
      enemiesList: enemiesListFiltered,
      resourcesList: resourcesListFiltered,
      recipesList: recipesList[resourceRecipeId],
    })
  );
});

app.get("/skills-list", async (req: Request, res: Response) => {
  res.send(JSON.stringify({ skillsList, skillsBriefDescription }));
});

app.get(
  "/skills-list/:specificSkillId",
  async (req: Request, res: Response) => {
    const { specificSkillId } = req.params;

    res.send(
      JSON.stringify({
        searchId: specificSkillId as SkillsFullInfoIds,
        skillsList,
        bossesList,
      })
    );
  }
);

app.get("/weapons", async (req: Request, res: Response) => {
  res.send(JSON.stringify({ weaponsList, bossesList }));
});

app.get("/weapons/:specificWeaponId", async (req: Request, res: Response) => {
  const { specificWeaponId } = req.params;

  res.send(
    JSON.stringify({
      searchId: specificWeaponId as TypesOfWeaponIds,
      weaponsList,
      bossesList,
    })
  );
});

app.get("/bosses", async (req: Request, res: Response) => {
  res.send(JSON.stringify({ briefDecriptionBosses, bossesList }));
});

app.get("/bosses/:bossId", async (req: Request, res: Response) => {
  const { bossId } = req.params;

  const data = {
    searchId: bossId,
    bossesList,
    skillsList,
    resourcesList,
    weaponsList,
  };
  res.send(JSON.stringify(data));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
