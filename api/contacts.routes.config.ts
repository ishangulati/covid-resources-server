import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";
import {
  addContact,
  addExtractedContact,
  findContactsByResource,
  getResourceByContact,
} from "../service/ContactService";

export class ContactsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "ContactsRoutes");
  }

  configureRoutes() {
    this.app
      .route(`/contact`)
      .post((req: express.Request, res: express.Response) => {
        addContact(req.headers["secret-key"] as string, req.body)
          .then((c) => res.status(200).send(c))
          .catch((e) => res.status(500).send(e));
      });

    this.app
      .route(`/extractedcontact`)
      .post((req: express.Request, res: express.Response) => {
        addExtractedContact(req.headers["secret-key"] as string, req.body)
          .then((c) => res.status(200).send(c))
          .catch((e) => res.status(500).send(e));
      });

    this.app
      .route(`/contacts`)
      .get((req: express.Request, res: express.Response) => {
        findContactsByResource(req.query)
          .then((c) => res.status(200).send(c))
          .catch((e) => res.status(500).send(e));
      });

    this.app
      .route(`/contacts/:contactuid`)
      .get((req: express.Request, res: express.Response) => {
        getResourceByContact(req.params.contactuid)
          .then((c) => res.status(200).send(c))
          .catch((e) => res.status(500).send(e));
      });

    return this.app;
  }
}
