import { useQuery } from "@tanstack/react-query";
import { getPublicProfessionalProfile } from "../api/get-public-professional-profile";
import { profileKeys } from "../model/profile-keys";

export function usePublicProfessionalProfile(username: string, includeContacts: boolean, enabled = true) {
  return useQuery({
    queryKey: [...profileKeys.all, "public", username, { includeContacts }],
    queryFn: () => getPublicProfessionalProfile(username, includeContacts),
    enabled: enabled && Boolean(username),
  });
}
