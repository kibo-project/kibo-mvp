"use client";

import React from "react";
import { NextPage } from "next";
import { Card } from "~~/components/kibo";

const Profile: NextPage = () => {
  return (
    <div className="flex bg-primary items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4">
      <Card className="w-full max-w-md mb-20">
        <div className="kibo-card-body text-center">
          <div className="mb-2">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-xl font-semibold text-base-content mb-2">Profile</h1>
            <p className="text-base-content/70 text-sm">There&apos;s nothing around here (yet).</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-base-content/60 text-sm mb-2">Have some flowers while we work on this</p>
              <p className="text-3xl">💐</p>
            </div>

            <div className="pt-4 border-t border-base-300 dark:border-base-200">
              <p className="text-xs text-base-content/50">Profile features coming soon...</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
