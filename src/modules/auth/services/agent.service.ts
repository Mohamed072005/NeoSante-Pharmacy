import { Injectable } from "@nestjs/common";
import { UserDocument } from "../../user/entities/user.entity";
import { AgentStatusEnum } from "../enums/agent.status.enum";

@Injectable()
export class AgentService {
  checkUserAgent (user: UserDocument, userAgent: string) {
    if (user.agents.length === 0) {
      return AgentStatusEnum.NEW_AGENT;
    }

    const currentAgent = user.agents.find((agent) => agent.name === userAgent);
    if (!currentAgent) {
      return AgentStatusEnum.NEW_AGENT;
    }

    if (!currentAgent.isCurrent) {
      return AgentStatusEnum.NOT_VERIFIED_AGENT;
    }

    return AgentStatusEnum.VERIFIED_AGENT;
  }
}