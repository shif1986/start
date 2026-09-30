#!/usr/bin/env bash

set -Eeuo pipefail

if [[ $# -ne 1 ]]; then
  echo "Utilisation : $0 chemin/vers/start-backup.tar.gz" >&2
  exit 2
fi

archive="$1"
if [[ ! -s "$archive" ]]; then
  echo "Archive absente ou vide : $archive" >&2
  exit 1
fi

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

tar -xzf "$archive" -C "$work_dir"

for required_file in metadata.json roles.sql schema.sql data.sql SHA256SUMS; do
  if [[ ! -s "$work_dir/$required_file" ]]; then
    echo "Fichier obligatoire absent ou vide : $required_file" >&2
    exit 1
  fi
done

(
  cd "$work_dir"
  shasum -a 256 -c SHA256SUMS
)

echo "Archive cohérente. Une restauration isolée reste obligatoire pour valider sa récupérabilité."
